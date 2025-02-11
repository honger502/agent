import typer
import uvicorn
from rich import print
from rich.console import Console
from rich.panel import Panel

console = Console()
app = typer.Typer()

@app.command()
def start(
    host: str = typer.Option("0.0.0.0", "--host", "-h", help="服务器主机地址"),
    port: int = typer.Option(8000, "--port", "-p", help="服务器端口"),
    reload: bool = typer.Option(True, "--reload/--no-reload", help="是否启用热重载"),
    workers: int = typer.Option(1, "--workers", "-w", help="工作进程数"),
    env_file: str = typer.Option(".env", "--env", "-e", help="环境变量文件路径")
):
    """
    启动 FastAPI 服务器
    """
    try:
        print(Panel.fit(
            "[green]OpenAI Compatible API Server[/green]",
            title="启动服务",
            border_style="blue"
        ))
        
        config = uvicorn.Config(
            "app.main:app",
            host=host,
            port=port,
            reload=reload,
            workers=workers,
            env_file=env_file,
            log_level="info",
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