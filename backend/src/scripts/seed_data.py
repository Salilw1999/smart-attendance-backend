from db.db import SessionLocal
from models.class_model import Class
from models.classroom_model import Classroom

db = SessionLocal()

# Insert Classes
classes = ["Class 8", "Class 9", "Class 10", "Class 11"]
for c in classes:
    db.add(Class(name=c))

# Insert Classrooms
classrooms = ["A1", "A2", "B1", "B2"]
for r in classrooms:
    db.add(Classroom(name=r))

db.commit()
db.close()
print("✅ Sample data inserted successfully!")
