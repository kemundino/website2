import { NextResponse } from 'next/server'

// Mock user data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
]

export async function GET() {
  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  const body = await request.json()
  const newUser = {
    id: users.length + 1,
    ...body
  }
  users.push(newUser)
  
  return NextResponse.json({ 
    message: 'User created successfully',
    user: newUser 
  }, { status: 201 })
}
