from app import db
from datetime import datetime
import os

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # 文件大小（字节）
    file_path = db.Column(db.String(500), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Document {self.original_filename}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'file_size_formatted': self.format_file_size(),
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'task_title': self.task.title if self.task else None
        }
    
    def format_file_size(self):
        """格式化文件大小"""
        size = self.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    @classmethod
    def get_documents_by_task(cls, task_id):
        return cls.query.filter_by(task_id=task_id).order_by(cls.upload_date.desc()).all()
    
    @classmethod
    def get_document_by_id(cls, document_id):
        return cls.query.get(document_id)
    
    @classmethod
    def create_document(cls, task_id, file, upload_folder):
        """
        创建文档记录并保存文件
        
        Args:
            task_id: 任务ID
            file: Flask的文件对象
            upload_folder: 上传文件夹路径
        
        Returns:
            Document对象或None
        """
        try:
            # 确保上传目录存在
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)
            
            # 生成唯一文件名
            filename = f"{datetime.utcnow().timestamp()}_{file.filename}"
            file_path = os.path.join(upload_folder, filename)
            
            # 保存文件
            file.save(file_path)
            
            # 创建文档记录
            document = cls(
                task_id=task_id,
                filename=filename,
                original_filename=file.filename,
                file_type=file.filename.split('.')[-1].lower() if '.' in file.filename else 'unknown',
                file_size=os.path.getsize(file_path),
                file_path=file_path
            )
            
            db.session.add(document)
            db.session.commit()
            
            return document
            
        except Exception as e:
            db.session.rollback()
            # 如果保存失败，删除已保存的文件
            if os.path.exists(file_path):
                os.remove(file_path)
            raise e
    
    @classmethod
    def delete_document(cls, document_id):
        """删除文档记录和文件"""
        document = cls.get_document_by_id(document_id)
        if document:
            try:
                # 删除物理文件
                if os.path.exists(document.file_path):
                    os.remove(document.file_path)
                
                # 删除数据库记录
                db.session.delete(document)
                db.session.commit()
                return True
            except Exception as e:
                db.session.rollback()
                raise e
        return False
    
    @staticmethod
    def is_allowed_file(filename, allowed_extensions=None):
        """检查文件类型是否允许"""
        if allowed_extensions is None:
            allowed_extensions = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
        
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in allowed_extensions