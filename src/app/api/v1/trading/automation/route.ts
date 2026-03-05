import { NextResponse } from 'next/server';
import { AutomationEngine } from '../../../../../../backend/services/automation-engine';

const automationEngine = new AutomationEngine();
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await automationEngine.initialize();
    initialized = true;
  }
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { positionId, userId, ruleType, price, trailingPercent, currentPrice } = body;

    if (!positionId || !userId || !ruleType) {
      return NextResponse.json({ error: 'Missing required fields: positionId, userId, ruleType' }, { status: 400 });
    }

    let ruleId: string;

    switch (ruleType) {
      case 'STOP_LOSS':
        if (!price) {
          return NextResponse.json({ error: 'Missing price for stop loss' }, { status: 400 });
        }
        ruleId = await automationEngine.setStopLoss(positionId, userId, parseFloat(price));
        break;

      case 'TAKE_PROFIT':
        if (!price) {
          return NextResponse.json({ error: 'Missing price for take profit' }, { status: 400 });
        }
        ruleId = await automationEngine.setTakeProfit(positionId, userId, parseFloat(price));
        break;

      case 'TRAILING_STOP':
        if (!trailingPercent || !currentPrice) {
          return NextResponse.json(
            { error: 'Missing trailingPercent or currentPrice for trailing stop' },
            { status: 400 },
          );
        }
        ruleId = await automationEngine.setTrailingStop(
          positionId,
          userId,
          parseFloat(trailingPercent),
          parseFloat(currentPrice),
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid ruleType. Must be STOP_LOSS, TAKE_PROFIT, or TRAILING_STOP' },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      ruleId,
      message: `${ruleType} set successfully`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to set automation rule';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('positionId');

    if (!positionId) {
      return NextResponse.json({ error: 'Missing positionId parameter' }, { status: 400 });
    }

    const rules = await automationEngine.getPositionRules(positionId);

    return NextResponse.json({
      success: true,
      rules,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch automation rules';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureInitialized();

    const body = await request.json();
    const { ruleId, userId } = body;

    if (!ruleId || !userId) {
      return NextResponse.json({ error: 'Missing required fields: ruleId, userId' }, { status: 400 });
    }

    await automationEngine.cancelRule(ruleId, userId);

    return NextResponse.json({
      success: true,
      message: 'Automation rule cancelled',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel automation rule';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
