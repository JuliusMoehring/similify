from dotenv import load_dotenv
import os
import pandas as pd
from sqlalchemy import create_engine, text
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

load_dotenv()

engine = create_engine(os.getenv("POSTGRES_URL"))

session_id = "237875de-db2e-43d9-9905-401437620320"

with engine.connect() as connection:
    attendee_to_spotify_tracks = pd.read_sql_query(
        f"SELECT * FROM attendee_to_spotify_tracks AS atst WHERE atst.session_id = '{session_id}';",
        connection,
    )

    attendee_to_spotify_artists = pd.read_sql_query(
        f"SELECT * FROM attendee_to_spotify_artists AS atsa WHERE atsa.session_id = '{session_id}';",
        connection,
    )

    attendee_to_spotify_genres = pd.read_sql_query(
        f"SELECT * FROM attendee_to_spotify_genres AS atsg WHERE atsg.session_id = '{session_id}';",
        connection,
    )


attendees = pd.concat(
    [
        attendee_to_spotify_tracks["attendee_id"],
        attendee_to_spotify_artists["attendee_id"],
        attendee_to_spotify_genres["attendee_id"],
    ]
)

unique_attendees = attendees.unique()

unique_tracks = attendee_to_spotify_tracks["track_id"].unique()

# TRACKS

tracks_dataframe = pd.DataFrame(index=unique_attendees, columns=unique_tracks, data=0)

for index, row in attendee_to_spotify_tracks.iterrows():
    tracks_dataframe.at[row["attendee_id"], row["track_id"]] = 1


tracks_similarity = cosine_similarity(tracks_dataframe)

# ARTISTS

unique_artists = attendee_to_spotify_artists["artist_id"].unique()

artists_dataframe = pd.DataFrame(index=unique_attendees, columns=unique_artists, data=0)

for index, row in attendee_to_spotify_artists.iterrows():
    artists_dataframe.at[row["attendee_id"], row["artist_id"]] = 1

artists_similarity = cosine_similarity(artists_dataframe)

# GENRES

unique_genres = attendee_to_spotify_genres["genre_id"].unique()

genres_dataframe = pd.DataFrame(index=unique_attendees, columns=unique_genres, data=0)

for index, row in attendee_to_spotify_genres.iterrows():
    genres_dataframe.at[row["attendee_id"], row["genre_id"]] = 1

genres_similarity = cosine_similarity(genres_dataframe)

# CALCULATE OVERALL SIMILARITY

TRACK_WEIGHT = 0.5
ARTIST_WEIGHT = 0.3
GENRE_WEIGHT = 0.2

overall_similarity = (
    tracks_similarity * TRACK_WEIGHT
    + artists_similarity * ARTIST_WEIGHT
    + genres_similarity * GENRE_WEIGHT
) / (TRACK_WEIGHT + ARTIST_WEIGHT + GENRE_WEIGHT)


# Create a dataframe with the similarity matrix

similarity_df = pd.DataFrame(
    data=overall_similarity, index=unique_attendees, columns=unique_attendees
)

print(similarity_df)

row_indices, col_indices = np.triu_indices(len(similarity_df.columns), k=1)

rows = [similarity_df.index[row_indices[i]] for i in range(len(row_indices))]
cols = [similarity_df.index[col_indices[i]] for i in range(len(col_indices))]
values = [
    similarity_df.iloc[row_indices[i], col_indices[i]] for i in range(len(row_indices))
]

# Create DataFrame
result_df = pd.DataFrame(
    {"attendee_id": rows, "similar_attendee_id": cols, "similarity_value": values}
)

result_df["session_id"] = session_id

# Insert into database

with engine.connect() as connection:

    connection.execute(
        text(f"DELETE FROM similarities WHERE session_id = '{session_id}';")
    )

    result_df.to_sql(
        "similarities",
        connection,
        if_exists="append",
        index=False,
        method="multi",
    )

    connection.commit()

    print("Similarity data inserted into database")
