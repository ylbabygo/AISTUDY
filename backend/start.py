#!/usr/bin/env python3
"""
项目管理系统启动脚本
"""

from app import create_app, db
from app.models import Project, Task, Document, TimeLog
import os
import click

app = create_app()

@app.cli.command()
@click.option('--drop', is_flag=True, help='删除现有数据库')
def init_db(drop):
    """初始化数据库"""
    if drop:
        click.confirm('此操作将删除所有数据，是否继续？', abort=True)
        db.drop_all()
        click.echo('已删除现有数据库')
    
    db.create_all()
    click.echo('数据库初始化完成')

@app.cli.command()
def forge():
    """生成测试数据"""
    from datetime import datetime, timedelta
    
    db.create_all()
    
    # 创建测试项目
    projects = [
        {
            'name': '网站重构项目',
            'description': '对公司官网进行全面重构，采用现代化的技术栈',
            'start_date': datetime.now().date(),
            'end_date': (datetime.now() + timedelta(days=30)).date()
        },
        {
            'name': '移动应用开发',
            'description': '开发iOS和Android移动应用',
            'start_date': datetime.now().date(),
            'end_date': (datetime.now() + timedelta(days=60)).date()
        }
    ]
    
    for project_data in projects:
        project = Project.create_project(project_data)
        click.echo(f'创建项目: {project.name}')
        
        # 为每个项目创建任务
        tasks = [
            {
                'project_id': project.id,
                'title': '需求分析',
                'description': '收集和分析项目需求',
                'status': 'done',
                'priority': 'high',
                'assignee': '张三'
            },
            {
                'project_id': project.id,
                'title': '系统设计',
                'description': '设计系统架构和技术方案',
                'status': 'in_progress',
                'priority': 'high',
                'assignee': '李四'
            },
            {
                'project_id': project.id,
                'title': '前端开发',
                'description': '开发用户界面和交互功能',
                'status': 'todo',
                'priority': 'medium',
                'assignee': '王五'
            },
            {
                'project_id': project.id,
                'title': '后端开发',
                'description': '开发API和业务逻辑',
                'status': 'todo',
                'priority': 'medium',
                'assignee': '赵六'
            }
        ]
        
        for task_data in tasks:
            task = Task.create_task(task_data)
            click.echo(f'  创建任务: {task.title}')
    
    click.echo('测试数据生成完成')

@app.cli.command()
@click.option('--host', default='0.0.0.0', help='监听主机')
@click.option('--port', default=5000, help='监听端口')
@click.option('--debug', is_flag=True, help='调试模式')
def run(host, port, debug):
    """启动开发服务器"""
    app.run(host=host, port=port, debug=debug)

if __name__ == '__main__':
    # 确保上传目录存在
    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    
    # 启动应用
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    )