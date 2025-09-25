from app import db
from datetime import datetime

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    tasks = db.relationship('Task', back_populates='project', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Project {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'task_count': len(self.tasks)
        }
    
    @classmethod
    def get_all_projects(cls):
        return cls.query.order_by(cls.created_at.desc()).all()
    
    @classmethod
    def get_project_by_id(cls, project_id):
        return cls.query.get(project_id)
    
    @classmethod
    def create_project(cls, data):
        project = cls(**data)
        db.session.add(project)
        db.session.commit()
        return project
    
    @classmethod
    def update_project(cls, project_id, data):
        project = cls.get_project_by_id(project_id)
        if project:
            for key, value in data.items():
                if hasattr(project, key):
                    setattr(project, key, value)
            db.session.commit()
        return project
    
    @classmethod
    def delete_project(cls, project_id):
        project = cls.get_project_by_id(project_id)
        if project:
            db.session.delete(project)
            db.session.commit()
            return True
        return False