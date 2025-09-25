import os
from datetime import datetime

def allowed_file(filename, allowed_extensions=None):
    """检查文件类型是否允许"""
    if allowed_extensions is None:
        allowed_extensions = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
    
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def validate_date_format(date_string, format='%Y-%m-%d'):
    """验证日期格式"""
    try:
        datetime.strptime(date_string, format)
        return True
    except ValueError:
        return False

def validate_task_status(status):
    """验证任务状态"""
    valid_statuses = ['todo', 'in_progress', 'done']
    return status in valid_statuses

def validate_task_priority(priority):
    """验证任务优先级"""
    valid_priorities = ['low', 'medium', 'high']
    return priority in valid_priorities

def format_file_size(size_in_bytes):
    """格式化文件大小"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_in_bytes < 1024.0:
            return f"{size_in_bytes:.1f} {unit}"
        size_in_bytes /= 1024.0
    return f"{size_in_bytes:.1f} TB"

def generate_unique_filename(original_filename, upload_folder):
    """生成唯一文件名"""
    from datetime import datetime
    import os
    
    timestamp = datetime.utcnow().timestamp()
    filename = f"{timestamp}_{original_filename}"
    return os.path.join(upload_folder, filename)

def sanitize_filename(filename):
    """清理文件名，移除不安全字符"""
    import re
    # 只允许字母、数字、下划线、连字符和点
    filename = re.sub(r'[^\w\-\.]', '_', filename)
    # 确保只有一个点
    filename = re.sub(r'\.+', '.', filename)
    return filename

def validate_project_data(data):
    """验证项目数据"""
    errors = []
    
    # 验证项目名称
    if not data.get('name') or len(data['name'].strip()) == 0:
        errors.append('项目名称不能为空')
    elif len(data['name']) > 100:
        errors.append('项目名称不能超过100个字符')
    
    # 验证日期
    if not data.get('start_date'):
        errors.append('开始日期不能为空')
    elif not validate_date_format(data['start_date']):
        errors.append('开始日期格式错误，应为YYYY-MM-DD')
    
    if not data.get('end_date'):
        errors.append('结束日期不能为空')
    elif not validate_date_format(data['end_date']):
        errors.append('结束日期格式错误，应为YYYY-MM-DD')
    
    # 验证日期逻辑
    if data.get('start_date') and data.get('end_date'):
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')
            if start_date > end_date:
                errors.append('开始日期不能晚于结束日期')
        except ValueError:
            pass  # 日期格式错误已在上面处理
    
    return errors

def validate_task_data(data):
    """验证任务数据"""
    errors = []
    
    # 验证任务标题
    if not data.get('title') or len(data['title'].strip()) == 0:
        errors.append('任务标题不能为空')
    elif len(data['title']) > 200:
        errors.append('任务标题不能超过200个字符')
    
    # 验证项目ID
    if not data.get('project_id'):
        errors.append('项目ID不能为空')
    
    # 验证状态
    if data.get('status') and not validate_task_status(data['status']):
        errors.append('任务状态无效，必须是todo、in_progress或done')
    
    # 验证优先级
    if data.get('priority') and not validate_task_priority(data['priority']):
        errors.append('任务优先级无效，必须是low、medium或high')
    
    # 验证时间
    if data.get('start_time') and not validate_date_format(data['start_time'], '%Y-%m-%dT%H:%M:%S'):
        errors.append('开始时间格式错误')
    
    if data.get('end_time') and not validate_date_format(data['end_time'], '%Y-%m-%dT%H:%M:%S'):
        errors.append('结束时间格式错误')
    
    return errors