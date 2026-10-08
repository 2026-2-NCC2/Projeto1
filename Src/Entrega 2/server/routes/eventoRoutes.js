import event from 'express'
import cors from 'cors'
import pool from './config/db.js'

const event = event()

event.post('/event_register')