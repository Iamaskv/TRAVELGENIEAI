import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserStore } from '../models/index.js';
import { RegisterSchema, LoginSchema } from '../validators/index.js';
import { ENV } from '../config/env.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const validated = RegisterSchema.parse(req.body);

      const existing = await UserStore.findByEmail(validated.email);
      if (existing) {
        res.status(409).json({ error: 'An account with this email address already exists.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(validated.password, salt);

      const user = await UserStore.create({
        name: validated.name,
        email: validated.email,
        passwordHash,
        preferences: validated.preferences,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferences: user.preferences,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const validated = LoginSchema.parse(req.body);

      const user = await UserStore.findByEmail(validated.email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferences: user.preferences,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = await UserStore.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User profile not found.' });
        return;
      }

      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          preferences: user.preferences,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
