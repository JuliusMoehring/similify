from dotenv import load_dotenv

load_dotenv()

import os
import pandas as pd
from sqlalchemy import create_engine
from scipy.spatial.distance import pdist, squareform
import networkx as nx
import matplotlib.pyplot as plt
import numpy as np
from pyvis.network import Network


engine = create_engine(os.getenv("DATABASE_URL"))

with engine.connect() as connection:
    session_id = "b5c3f928-efe1-4fd2-ab02-ce88e7c493fc"

    attendee_to_spotify_tracks = pd.read_sql_query(
        f"SELECT * FROM attendee_to_spotify_tracks AS atst WHERE atst.session_id = '{session_id}';",
        connection,
    )

unique_attendees = attendee_to_spotify_tracks["attendee_id"].unique()
unique_tracks = attendee_to_spotify_tracks["track_id"].unique()

dataframe = pd.DataFrame(index=unique_attendees, columns=unique_tracks, data=0)

for index, row in attendee_to_spotify_tracks.iterrows():
    dataframe.at[row["attendee_id"], row["track_id"]] = 1

dists = pdist(dataframe, metric="euclid")

euclidean_distance = pd.DataFrame(
    squareform(dists), columns=dataframe.index, index=dataframe.index
)


upper_triangle = euclidean_distance.where(
    ~np.tri(*euclidean_distance.shape, k=0, dtype=bool)
)


unique_combinations = (
    upper_triangle.stack()
    .reset_index()
    .rename(columns={"level_0": "row", "level_1": "column", 0: "value"})
)


G = nx.Graph()

from random import randint

for index, row in unique_combinations.iterrows():
    G.add_edge(row["row"], row["column"], weight=row["value"])

net = Network(height="750px", width="100%", bgcolor="#222222", font_color="white")

net.from_nx(G)

net.show("example.html")

exit()


pos = nx.spring_layout(G, weight="weight")

nx.draw(
    G,
    pos,
    with_labels=True,
    node_size=2000,
    node_color="skyblue",
    font_size=10,
    font_weight="bold",
)


edge_labels = nx.get_edge_attributes(G, "weight")
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)


plt.title("Similarity Graph of Users")
plt.show()
