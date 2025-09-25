from app import db
from datetime import datetime, timedelta

class TimeLog(db.Model):
    __tablename__ = 'time_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    end_time = db.Column(db.DateTime)
    duration = db.Column(db.Integer)  # 持续时间（分钟）
    description = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<TimeLog {self.id}: {self.start_time} - {self.end_time or "running"}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration': self.duration,
            'duration_formatted': self.format_duration(),
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_running': self.end_time is None,
            'task_title': self.task.title if self.task else None
        }
    
    def format_duration(self):
        """格式化持续时间"""
        if self.duration:
            hours = self.duration // 60
            minutes = self.duration % 60
            if hours > 0:
                return f"{hours}小时{minutes}分钟"
            else:
                return f"{minutes}分钟"
        elif self.end_time and self.start_time:
            # 计算持续时间
            duration_delta = self.end_time - self.start_time
            duration_minutes = int(duration_delta.total_seconds() / 60)
            hours = duration_minutes // 60
            minutes = duration_minutes % 60
            if hours > 0:
                return f"{hours}小时{minutes}分钟"
            else:
                return f"{minutes}分钟"
        elif self.start_time and not self.end_time:
            # 正在运行中，计算已运行时间
            elapsed = datetime.utcnow() - self.start_time
            elapsed_minutes = int(elapsed.total_seconds() / 60)
            hours = elapsed_minutes // 60
            minutes = elapsed_minutes % 60
            if hours > 0:
                return f"{hours}小时{minutes}分钟"
            else:
                return f"{minutes}分钟"
        else:
            return "0分钟"
    
    def calculate_duration(self):
        """计算持续时间（分钟）"""
        if self.start_time and self.end_time:
            duration_delta = self.end_time - self.start_time
            return int(duration_delta.total_seconds() / 60)
        elif self.start_time and not self.end_time:
            # 正在运行中，计算已运行时间
            elapsed = datetime.utcnow() - self.start_time
            return int(elapsed.total_seconds() / 60)
        return 0
    
    @classmethod
    def get_time_logs_by_task(cls, task_id):
        return cls.query.filter_by(task_id=task_id).order_by(cls.start_time.desc()).all()
    
    @classmethod
    def get_running_timer(cls, task_id):
        """获取任务正在运行的时间日志"""
        return cls.query.filter_by(task_id=task_id, end_time=None).first()
    
    @classmethod
    def start_timer(cls, task_id, description=None):
        """开始计时"""
        # 检查是否已有正在运行的计时器
        running_timer = cls.get_running_timer(task_id)
        if running_timer:
            return running_timer
        
        # 创建新的时间日志
        time_log = cls(
            task_id=task_id,
            description=description,
            start_time=datetime.utcnow()
        )
        
        db.session.add(time_log)
        db.session.commit()
        return time_log
    
    @classmethod
    def stop_timer(cls, task_id, description=None):
        """停止计时"""
        # 查找正在运行的计时器
        running_timer = cls.get_running_timer(task_id)
        if not running_timer:
            return None
        
        # 停止计时
        running_timer.end_time = datetime.utcnow()
        running_timer.duration = running_timer.calculate_duration()
        
        if description:
            running_timer.description = description
        
        db.session.commit()
        return running_timer
    
    @classmethod
    def get_total_time_by_task(cls, task_id):
        """获取任务总耗时（分钟）"""
        time_logs = cls.query.filter_by(task_id=task_id).all()
        total_minutes = 0
        for log in time_logs:
            if log.duration:
                total_minutes += log.duration
            elif log.start_time and log.end_time:
                duration = log.calculate_duration()
                total_minutes += duration
        return total_minutes
    
    def update_duration(self):
        """更新持续时间"""
        self.duration = self.calculate_duration()
        db.session.commit()