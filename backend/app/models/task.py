from app import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='todo', nullable=False)  # todo, in_progress, done
    assignee = db.Column(db.String(100))
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    depends_on = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=True)
    priority = db.Column(db.String(10), default='medium', nullable=False)  # low, medium, high
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    project = db.relationship('Project', back_populates='tasks')
    dependencies = db.relationship('Task', remote_side=[id], backref='dependent_tasks')
    time_logs = db.relationship('TimeLog', backref='task', lazy=True, cascade='all, delete-orphan')
    documents = db.relationship('Document', backref='task', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Task {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'assignee': self.assignee,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'depends_on': self.depends_on,
            'priority': self.priority,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'project_name': self.project.name if self.project else None,
            'time_logs_count': len(self.time_logs),
            'documents_count': len(self.documents)
        }
    
    @classmethod
    def get_tasks_by_project(cls, project_id):
        return cls.query.filter_by(project_id=project_id).order_by(cls.created_at.desc()).all()
    
    @classmethod
    def get_task_by_id(cls, task_id):
        return cls.query.get(task_id)
    
    @classmethod
    def get_tasks_by_status(cls, status, project_id=None):
        query = cls.query.filter_by(status=status)
        if project_id:
            query = query.filter_by(project_id=project_id)
        return query.order_by(cls.created_at.desc()).all()
    
    @classmethod
    def create_task(cls, data):
        task = cls(**data)
        db.session.add(task)
        db.session.commit()
        return task
    
    @classmethod
    def update_task(cls, task_id, data):
        task = cls.get_task_by_id(task_id)
        if task:
            for key, value in data.items():
                if hasattr(task, key):
                    setattr(task, key, value)
            db.session.commit()
        return task
    
    @classmethod
    def delete_task(cls, task_id):
        task = cls.get_task_by_id(task_id)
        if task:
            db.session.delete(task)
            db.session.commit()
            return True
        return False
    
    @classmethod
    def update_task_status(cls, task_id, new_status):
        task = cls.get_task_by_id(task_id)
        if task:
            task.status = new_status
            db.session.commit()
            return task
        return None
    
    def get_total_time(self):
        """获取任务总耗时（分钟）"""
        total_minutes = 0
        for log in self.time_logs:
            if log.duration:
                total_minutes += log.duration
        return total_minutes
    
    def is_timer_running(self):
        """检查任务计时器是否正在运行"""
        return any(log.end_time is None for log in self.time_logs)