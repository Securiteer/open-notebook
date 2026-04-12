from open_notebook.trading.models import TradingIntegration, TradingWorkflow


# Gemini Integration stub
async def generate_workflow_with_gemini(prompt: str) -> str:
    # This would call the real Gemini API via Langchain or Esperanto
    # For now, it's a stub that returns a fake strategy
    return f"Strategy based on: {prompt}. Buy low, sell high."

async def create_integration(data: dict) -> TradingIntegration:
    integration = TradingIntegration(**data)
    await integration.save()
    return integration

async def create_workflow(data: dict) -> TradingWorkflow:
    # Assuming the prompt is what the user wrote and we use Gemini to expand it
    gemini_strategy = await generate_workflow_with_gemini(data["prompt"])
    workflow = TradingWorkflow(
        name=data["name"],
        description=data["description"],
        prompt=gemini_strategy,
        integration_id=data["integration_id"]
    )
    await workflow.save()
    return workflow
