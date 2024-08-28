# Welcome to Venzi!

## What is Venzi?

Venzi is a simple framework with minimalistic design and small footprint, making it ideal for projects where performance and low resource consumption are critical.

## Why Venzi?

I built Venzi as a helper project for my personal development, taking massive inspiration from Express and Hono. Venzi does not try to be better, just a lot less size. Coming from a different tech stack, I built Venzi just to see how I would implement it.

## Getting started

    import Venzi from "venzi"
    
    const app = new Venzi()
    
    //localhost:3001
    app.get('/', (c) => {
		c.json({
		    message: 'Hello Venzi'
		})
    })
    
    //localhost:3001/html
    app.get('/html', (c) => {
        	c.html('<h1>This is a Heading!</h1>')
    })
    
    //localhost:3001/1
    app.get('/:id', (c) => {
	        const id = c.param('id')
		c.text(`id: ${id}`)
    })
    
    //localhost:3001/id?id=1
    app.get('/id', (c) => {
		const id = c.query('id')
		c.text(`id: ${id}`)
    })
    
    const PORT = 3001 || 5001
		app.listen(PORT, () => {
		console.log(`Server is running on http://localhost:${PORT}`)
    })
