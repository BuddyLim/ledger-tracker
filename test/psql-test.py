from sqlalchemy import create_engine
from sqlalchemy.sql import text

sql = """
SELECT *
FROM user_table

"""

user = "test"
pwd = "test"
ip = "ec2-52-221-181-223.ap-southeast-1.compute.amazonaws.com"
db_name = "test_db"

engine = create_engine(f"postgresql://{user}:{pwd}@{ip}/{db_name}")

with engine.connect() as con:
    statement = text(sql)
    res = con.execute(statement)

    print(res.all())
