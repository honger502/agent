import os
import sys
import subprocess
from pathlib import Path
import venv
from rich.console import Console
from rich.panel import Panel

console = Console()

def create_venv(venv_path: Path):
    """创建虚拟环境"""
    console.print(Panel("Creating virtual environment...", style="blue"))
    venv.create(venv_path, with_pip=True)

def install_requirements(venv_path: Path, requirements_path: Path):
    """安装依赖包"""
    console.print(Panel("Installing requirements...", style="blue"))
    
    # 获取 pip 路径
    if sys.platform == "win32":
        pip_path = venv_path / "Scripts" / "pip"
    else:
        pip_path = venv_path / "bin" / "pip"
    
    # 安装依赖
    subprocess.run([str(pip_path), "install", "-r", str(requirements_path)])

def main():
    # 项目根目录
    root_dir = Path(__file__).parent.parent
    venv_path = root_dir / "venv"
    requirements_path = root_dir / "requirements.txt"
    
    try:
        # 创建虚拟环境
        if not venv_path.exists():
            create_venv(venv_path)
        
        # 安装依赖
        install_requirements(venv_path, requirements_path)
        
        console.print(Panel("""
Virtual environment setup completed!

To activate the virtual environment:
[green]Windows:[/green] venv\\Scripts\\activate
[green]Linux/Mac:[/green] source venv/bin/activate

To start the server:
[green]python run.py[/green]
        """, title="Setup Complete", style="green"))
        
    except Exception as e:
        console.print(Panel(f"Error: {str(e)}", style="red"))
        sys.exit(1)

if __name__ == "__main__":
    main() 