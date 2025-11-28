import { NextResponse } from 'next/server';

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    return NextResponse.json({
        success: true,
        message: "API key deleted successfully"
    });
}
