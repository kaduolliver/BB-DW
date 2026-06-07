from app.services.auth_services import registrar_usuario
from app.database.db import SessionLocal
from app.models.usuario import Usuario

def create_admin():
    db = SessionLocal()
    admin_exists = db.query(Usuario).filter_by(role='admin').first()
    if admin_exists:
        print("Admin user already exists.")
        return

    data = {
        "nome": "Admin Supremo",
        "email": "admin@bbdw.com.br",
        "senha": "admin",
        "role": "admin"
    }
    
    try:
        registrar_usuario(data)
        print("Admin user created successfully!")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
