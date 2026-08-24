import pandas as pd

def load_data():
    df = pd.read_csv("anime-dataset-2025.csv")
    
    synopsis_genres = df['Synopsis'].combine_first(df['Genres'])
    synopsis_genres_themes = synopsis_genres.combine_first(df['Themes'])
    
    df['embedding_text'] = synopsis_genres_themes
    df = df.dropna(subset=['embedding_text'])
    return df