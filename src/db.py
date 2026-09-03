import os 
import psycopg2
from dotenv import load_dotenv
from data_prep import load_data,generate_embeddings
import pandas as pd
import ast
import numpy as np
load_dotenv()

def get_connection():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    return conn
def insert_embedding(df,embeddings):
    conn=get_connection()
    cur =conn.cursor()
    for i in range (len(df)) :
        title=df['Title'].iloc[i];
        genres=df['Genres'].iloc[i];
        synopsis=df['Synopsis'].iloc[i];
        raw_score = df['Score'].iloc[i]
        scores = None if pd.isna(raw_score) else float(raw_score)
        embedding=str(embeddings[i].tolist())
        cur.execute("INSERT INTO anime(title,embedding,genres,synopsis,score) Values( %s,%s,%s,%s,%s)",(title,embedding,genres,synopsis,scores))
    conn.commit()   
    conn.close()
    

def parse_embedding(embedding_str):
    as_list = ast.literal_eval(embedding_str)
    return np.array(as_list)    
def get_recommendations(title,top_n):
    conn = get_connection()
    cursor= conn.cursor()
 
        
    cursor.execute(" SELECT title, genres, synopsis, score, embedding, embedding <=> (SELECT embedding FROM anime WHERE title = %s) AS distance FROM anime WHERE title != %s ORDER BY distance LIMIT %s",(title,title,top_n))
    results =   cursor.fetchall()
    cursor.close()
    conn.close()
    for title, genres, synopsis, score, embedding, distance in results:
     print(f"{title} ({score}) - {distance:.3f}{embedding}")
    return results 
    
def main():
    try:
       results= get_recommendations('Death Note',30)
       first_embedding = results[0][4]  # index 4 = embedding, based on your SELECT order
       parsed = parse_embedding(first_embedding)
       print(type(parsed), parsed.shape)
            
    except Exception as e :print("Can't INSERT",e)
    
    
if __name__ =="__main__":
    main()


 