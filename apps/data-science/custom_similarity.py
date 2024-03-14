from dotenv import load_dotenv
import os
import pandas as pd
from sqlalchemy import create_engine, text
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

load_dotenv()

POSTGRES_URL = os.getenv("POSTGRES_URL")

if POSTGRES_URL is None:
    raise ValueError("POSTGRES_URL environment variable not set")

engine = create_engine(POSTGRES_URL)

"""
d6f32693-fef5-41fa-8624-95f66c489761
9a54ca96-538a-4b44-b31c-16d33ef85926
0a8acd27-cf2f-4c3f-8244-c94a7cad10ed
596ad36a-fdcb-47c5-97ea-ceddccbb16e9
8dbb6ee9-a95a-4298-8ade-9405d9c586b8
c3a1a5f3-251e-402a-9b58-430d2872f1a7
0beb4440-d78f-4400-a624-c4441633da8a
fc8dca05-fd4b-439b-bd40-a83abc43012c
"""

question_id = "9a54ca96-538a-4b44-b31c-16d33ef85926"


class CustomSimilarity:
    session_id: str
    question_id: str
    type: str

    question: pd.Series
    answer_options: pd.Series | None = None
    answers: pd.DataFrame
    attendees: np.ndarray

    def __init__(self, question_id: str):
        self.question_id = question_id

        with engine.connect() as connection:
            questions = pd.read_sql_query(
                f"SELECT * FROM custom_questions AS cq WHERE cq.id = '{question_id}';",
                connection,
            )

            question = questions.iloc[0]

            type = question["type"]

            assert type in ["free-text", "single-choice", "multiple-choice"]

            self.question = question
            self.session_id = question["session_id"]
            self.type = type

            self.answers = pd.read_sql_query(
                f"SELECT * FROM custom_question_answers AS cqa WHERE cqa.question_id = '{question_id}';",
                connection,
            )

            self.attendees = self.answers["attendee_id"].unique()

            if self.type != "free-text":
                self.answer_options = self.__get_answer_options()

    def __calculate_similarity(
        self,
        X: pd.DataFrame,
        Y: pd.DataFrame | None = None,
    ):

        similarities = cosine_similarity(X, Y)

        return pd.DataFrame(
            data=similarities, index=self.attendees, columns=self.attendees
        )

    @staticmethod
    def __get_attendee_similarities(data_frame: pd.DataFrame):
        row_indices, col_indices = np.triu_indices(len(data_frame.columns), k=1)

        rows = [data_frame.index[row_indices[i]] for i in range(len(row_indices))]
        cols = [data_frame.index[col_indices[i]] for i in range(len(col_indices))]
        values = [
            data_frame.iloc[row_indices[i], col_indices[i]]
            for i in range(len(row_indices))
        ]

        return pd.DataFrame(
            {
                "attendee_id": rows,
                "similar_attendee_id": cols,
                "similarity_value": values,
            }
        )

    def __get_answer_options(self) -> pd.Series:
        with engine.connect() as connection:
            answer_options = pd.read_sql_query(
                f"SELECT * FROM custom_question_options AS cqo WHERE cqo.question_id = '{self.question_id}';",
                connection,
            )

            return answer_options["option"]

    def __create_answer_dataframe(self) -> pd.DataFrame:
        return pd.DataFrame(index=self.attendees, columns=self.answer_options, data=0)

    def __write_to_database(self, data_frame: pd.DataFrame):
        data_frame["session_id"] = self.session_id
        data_frame["question_id"] = self.question_id

        with engine.connect() as connection:

            connection.execute(
                text(
                    f"DELETE FROM custom_question_answer_similarity WHERE question_id = '{self.question_id}';"
                )
            )

            data_frame.to_sql(
                "custom_question_answer_similarity",
                connection,
                if_exists="append",
                index=False,
                method="multi",
            )

            connection.commit()

            print("Similarity data inserted into database")

    def __calculate_free_text_similarity_embedding(self):
        from openai import OpenAI

        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

        client = OpenAI(
            api_key=OPENAI_API_KEY,
        )

        embeddings_response = client.embeddings.create(
            model="text-embedding-ada-002",
            input=[answer for answer in self.answers["answer"]],
        )

        embeddings_dict = embeddings_response.model_dump()

        embeddings = [data["embedding"] for data in embeddings_dict["data"]]

        data_frame = pd.DataFrame(index=self.attendees, data=embeddings)

        similarity = self.__calculate_similarity(data_frame)

        result = self.__get_attendee_similarities(similarity)

        self.__write_to_database(result)

    def __calculate_free_text_similarity(self):
        from sklearn.feature_extraction.text import TfidfVectorizer

        vectorizer = TfidfVectorizer()

        corpus = self.answers["answer"].str.lower()

        tf_idf_matrix = vectorizer.fit_transform(corpus)

        similarity = self.__calculate_similarity(tf_idf_matrix, tf_idf_matrix)

        result = self.__get_attendee_similarities(similarity)

        self.__write_to_database(result)

    def __calculate_choice_similarity(self):
        answers_dataframe = self.__create_answer_dataframe()

        for _, row in self.answers.iterrows():

            attendee_id = row["attendee_id"]

            if self.type == "single-choice":
                answers = [row["answer"]]

            elif self.type == "multiple-choice":
                answers = row["answer"].split(" | ")

            else:
                raise ValueError("Invalid type")

            for answer in answers:

                if answer not in self.answer_options.unique():
                    print(
                        answer,
                        self.answer_options,
                        self.question_id,
                        attendee_id,
                        row["answer"],
                    )

                    raise ValueError(
                        f"Invalid answer option ({answer}) for question ({self.question_id}) for attendee ({attendee_id})"
                    )

                answers_dataframe.at[row["attendee_id"], row["answer"]] = 1

        similarity = self.__calculate_similarity(answers_dataframe)

        result = self.__get_attendee_similarities(similarity)

        self.__write_to_database(result)

    def __update_overall_similarity(self):
        with engine.connect() as connection:
            similarities = pd.read_sql_query(
                f"SELECT * FROM custom_question_answer_similarity AS cqas WHERE cqas.session_id = '{self.session_id}';",
                connection,
            )

            overall_similarity = similarities.groupby(
                ["attendee_id", "similar_attendee_id"]
            ).agg({"similarity_value": "mean"})

            overall_similarity.reset_index(inplace=True)

            overall_similarity["session_id"] = self.session_id

            for _, row in overall_similarity.iterrows():

                database_entry = connection.execute(
                    text(
                        f"SELECT id FROM attendee_similarities AS ats WHERE ats.attendee_id = '{row['attendee_id']}' AND ats.similar_attendee_id = '{row['similar_attendee_id']}'"
                    )
                ).fetchone()

                if database_entry is None:
                    connection.execute(
                        text(
                            f"INSERT INTO attendee_similarities (attendee_id, similar_attendee_id, similarity_value, session_id) VALUES ('{row['attendee_id']}', '{row['similar_attendee_id']}', {row['similarity_value']}, '{self.session_id}');"
                        )
                    )

                    continue

                connection.execute(
                    text(
                        f"UPDATE attendee_similarities SET similarity_value = {row['similarity_value']} WHERE id = '{database_entry[0]}';"
                    )
                )

    def calculate_similarity(self):
        if self.type == "free-text":
            self.__calculate_free_text_similarity()
        elif self.type == "single-choice" or self.type == "multiple-choice":
            self.__calculate_choice_similarity()
        else:
            raise ValueError("Invalid type")

        self.__update_overall_similarity()


custom_similarity = CustomSimilarity(question_id)

custom_similarity.calculate_similarity()
