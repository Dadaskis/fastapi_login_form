import asyncio
from datetime import datetime

class VerificationCleanup:
    def __init__(self):
        self.task = None
        self.running = False
    
    async def start(self, interval_minutes: int = 60, cleanup_func = None):
        """Start the cleanup task running in the background."""
        self.running = True
        self.task = asyncio.create_task(self._run_cleanup(interval_minutes, cleanup_func))
        print(f"🧹 Verification cleanup scheduled every {interval_minutes} minutes")
    
    async def stop(self):
        """Stop the cleanup task."""
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        print("🧹 Verification cleanup stopped")
    
    async def _run_cleanup(self, interval_minutes: int, cleanup_func):
        """Run cleanup every interval_minutes."""
        while self.running:
            try:
                # Run cleanup
                await cleanup_func()
                print(f"🧹 Cleaned up expired verification codes at {datetime.now()}")
                
                # Wait for next interval
                await asyncio.sleep(interval_minutes * 60)
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"❌ Cleanup error: {e}")
                import traceback
                traceback.print_exc()
                await asyncio.sleep(60)  # Wait a minute before retrying on error