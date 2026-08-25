import os 
import psycopg2
from dotenv import load_dotenv
from data_prep import load_data,generate_embeddings

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
        embedding=str(embeddings[i].tolist())
        cur.execute("INSERT INTO anime(title,embedding) Values( %s,%s)",(title,embedding))
    conn.commit()   
    conn.close()
    
    
def get_recommendations(title,top_n):
    conn = get_connection()
    cursor= conn.cursor()
 
        
    cursor.execute("SELECT title,embedding <=> (Select embedding FROM anime WHERE  title =%s)AS distance  FROM  anime where title != %s ORDER BY distance LIMIT %s",(title,title,top_n))
    results =   cursor.fetchall()
    cursor.close()
    conn.close()
    return results 
    
def main():
    try:
       
            
        print(  get_recommendations('Death Note',15))
            
    except Exception as e :print("Can't INSERT",e)
    
    
if __name__ =="__main__":
    main()


 