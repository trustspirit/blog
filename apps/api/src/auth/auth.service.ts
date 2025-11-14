import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from '../firebase/firebase.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private client: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private firebaseService: FirebaseService,
  ) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async validateGoogleToken(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async loginWithGoogle(token: string) {
    const payload = await this.validateGoogleToken(token);
    
    if (!payload?.email || !payload?.name) {
      throw new UnauthorizedException('Invalid user data');
    }

    // Check if user is admin (you can configure allowed emails in env)
    const allowedEmails = (process.env.ADMIN_EMAILS || '').split(',');
    if (!allowedEmails.includes(payload.email)) {
      throw new UnauthorizedException('User is not authorized as admin');
    }

    const db = this.firebaseService.getFirestore();
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', payload.email).get();

    let userId: string;
    if (userSnapshot.empty) {
      const newUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        createdAt: new Date(),
      };
      const docRef = await usersRef.add(newUser);
      userId = docRef.id;
    } else {
      userId = userSnapshot.docs[0].id;
      // Update user info
      await usersRef.doc(userId).update({
        name: payload.name,
        picture: payload.picture,
        lastLoginAt: new Date(),
      });
    }

    const user = {
      id: userId,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    const accessToken = this.jwtService.sign({ sub: userId, email: payload.email });
    const refreshToken = this.jwtService.sign(
      { sub: userId, email: payload.email },
      { expiresIn: '7d' },
    );

    // Store refresh token in Firebase
    await db.collection('refreshTokens').doc(userId).set({
      token: refreshToken,
      userId,
      createdAt: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const db = this.firebaseService.getFirestore();
      const tokenDoc = await db.collection('refreshTokens').doc(payload.sub).get();

      if (!tokenDoc.exists || tokenDoc.data()?.token !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const db = this.firebaseService.getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      throw new UnauthorizedException('User not found');
    }

    const userData = userDoc.data();
    return {
      id: userDoc.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    };
  }

  async logout(userId: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('refreshTokens').doc(userId).delete();
    return { message: 'Logged out successfully' };
  }
}
