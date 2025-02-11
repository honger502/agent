import typer
import uvicorn
from rich import print
from rich.console import Console
from rich.panel import Panel
from dotenv import load_dotenv
import os

console = Console()
app = typer.Typer()

def load_env_config(env_file: str = ".env") -> dict:
    """
    加载环境变量配置
    """
    # 加载.env文件
    load_dotenv(env_file)
    
    # 从环境变量中读取配置，如果没有则使用默认值
    config = {
        "host": os.getenv("HOST", "0.0.0.0"),
        "port": int(os.getenv("PORT", "8000")),
        "workers": int(os.getenv("WORKERS", "1")),
        "reload": os.getenv("RELOAD", "true").lower() == "true",
        "log_level": os.getenv("LOG_LEVEL", "info")
    }
    
    return config

@app.command()
def start(
    host: str = typer.Option(None, "--host", "-h", help="服务器主机地址"),
    port: int = typer.Option(None, "--port", "-p", help="服务器端口"),
    reload: bool = typer.Option(None, "--reload/--no-reload", help="是否启用热重载"),
    workers: int = typer.Option(None, "--workers", "-w", help="工作进程数"),
    env_file: str = typer.Option(".env", "--env", "-e", help="环境变量文件路径")
):
    """
    启动 FastAPI 服务器
    """
    try:
        # 加载环境变量配置
        env_config = load_env_config(env_file)
        
        # 命令行参数优先级高于环境变量配置
        final_config = {
            "host": host or env_config["host"],
            "port": port or env_config["port"],
            "workers": workers or env_config["workers"],
            "reload": reload if reload is not None else env_config["reload"],
            "log_level": env_config["log_level"]
        }
        
        print(Panel.fit(
            "[green]OpenAI Compatible API Server[/green]\n" +
            f"Host: {final_config['host']}\n" +
            f"Port: {final_config['port']}\n" +
            f"Workers: {final_config['workers']}\n" +
            f"Reload: {final_config['reload']}\n" +
            f"Log Level: {final_config['log_level']}",
            title="启动服务",
            border_style="blue"
        ))
        
        config = uvicorn.Config(
            "app.main:app",
            host=final_config["host"],
            port=final_config["port"],
            reload=final_config["reload"],
            workers=final_config["workers"],
            log_level=final_config["log_level"],
            reload_includes=["*.py", "*.html", "*.js", "*.css"],
            reload_excludes=[".*", "*.pyc", "__pycache__"],
        )
        
        server = uvicorn.Server(config)
        server.run()
        
    except Exception as e:
        console.print(f"[red]错误: {str(e)}[/red]")
        raise typer.Exit(1)

if __name__ == "__main__":
    app() 