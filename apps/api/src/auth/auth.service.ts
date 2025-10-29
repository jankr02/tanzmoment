import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register new user
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Ein Konto mit dieser E-Mail-Adresse existiert bereits');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'CUSTOMER',
        emailVerified: false,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    this.logger.log(`New user registered: ${user.email}`);

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: this.sanitizeUser(user),
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.getTokenExpiresIn(),
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('E-Mail oder Passwort ist falsch');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Dein Konto wurde deaktiviert');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-Mail oder Passwort ist falsch');
    }

    this.logger.log(`User logged in: ${user.email}`);

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: this.sanitizeUser(userWithoutPassword),
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.getTokenExpiresIn(),
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: string, email: string, role: string): string {
    const payload = {
      sub: userId,
      email,
      role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Get token expiration time in seconds
   */
  private getTokenExpiresIn(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    
    // Convert to seconds
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60;
    }
    
    return 604800; // Default: 7 days
  }

  /**
   * Sanitize user object for response
   */
  private sanitizeUser(user: any): UserDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || undefined,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
