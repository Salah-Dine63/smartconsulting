const { NextResponse } = require('next/server');
console.log(NextResponse.json({ error: "Stripe session creation failed" }).body);
