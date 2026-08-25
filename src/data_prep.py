import pandas as pd
from sentence_transformers import SentenceTransformer

def load_data():
    df = pd.read_csv("anime-dataset-2025.csv")
    
    synopsis_genres = df['Synopsis'].combine_first(df['Genres'])
    synopsis_genres_themes = synopsis_genres.combine_first(df['Themes'])
    
    df['embedding_text'] = synopsis_genres_themes
    df = df.dropna(subset=['embedding_text'])
    return df
def generate_embeddings(df):
    
    model = SentenceTransformer('all-MiniLM-L6-v2')
    

    texts = df['embedding_text'].tolist()  
    embeddings = model.encode(texts, batch_size=32, show_progress_bar=True)
    print(f"Generated embeddings for {len(embeddings)} texts.")
    print(embeddings.shape)
    return embeddings  
def main():
        generate_embeddings(load_data())
        
if __name__ == "__main__":
    main()

