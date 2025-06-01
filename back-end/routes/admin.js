import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        isAdmin: true,
        apiKey: true,
        githubId: true,
        googleId: true,
        vsbId: true,
      },
    });

    const usersWithApiKeyStatus = users.map(user => ({
      ...user,
      apiKey: !!user.apiKey,
      // Add auth method info
      authMethod: user.githubId
        ? 'GitHub'
        : user.googleId
          ? 'Google'
          : user.vsbId
            ? 'VSB'
            : 'Email',
    }));

    res.json(usersWithApiKeyStatus);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Update user
router.put('/users/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, email, isEmailVerified } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { username, email, isEmailVerified },
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user being deleted is not an admin
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (userToDelete.isAdmin) {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get API key for a user
router.get('/users/:id/apikey', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        apiKey: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ apiKey: user.apiKey || '' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get API key' });
  }
});

// Update the PUT route to handle API key updates
router.put('/users/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, email, isEmailVerified, isAdmin: userIsAdmin, apiKey } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username,
        email,
        isEmailVerified,
        isAdmin: userIsAdmin,
        apiKey,
      },
    });

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

export default router;
