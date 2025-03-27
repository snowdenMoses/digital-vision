import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

const mockEmail = 'test@example.com';
const mockPassword = 'securepassword';
const mockUserId = '123';
const mockBiometricKey = 'biometric123';
const mockJwtToken = 'mocked-jwt-token';
let mockHashedPassword = 'hashedpassword';

jest.mock('bcrypt');

const mockUser = { id: mockUserId, email: mockEmail, biometricKey: mockBiometricKey, createdAt: new Date() };

const mockPrismaService = {
  user: {
    create: jest.fn().mockResolvedValue(mockUser),
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([mockUser]),
    update: jest.fn().mockResolvedValue(mockUser)
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue(mockJwtToken),
};

describe('UserService', () => {
  let userService: UserService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);

    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await userService.register(mockEmail, mockPassword);
      expect(result).toHaveProperty('email', mockEmail);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw an error if email is already taken', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      await expect(userService.register(mockEmail, mockPassword)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await userService.getUserById(mockUserId);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(userService.getUserById(mockUserId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await userService.login(mockEmail, mockPassword);
      expect(result).toHaveProperty('accessToken', mockJwtToken);
    });

    it('should throw an error if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(userService.login(mockEmail, mockPassword)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('biometricLogin', () => {
    it('should return a token on successful biometric login', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      const result = await userService.biometricLogin(mockBiometricKey);
      expect(result).toHaveProperty('accessToken', mockJwtToken);
    });

    it('should throw an error if biometric key is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(userService.biometricLogin('wrong-key')).rejects.toThrow(Error);
    });
  });

  describe('updateBiometricKey', () => {
    it('should update biometric key successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(userService.updateBiometricKey(mockUserId, mockBiometricKey)).resolves.not.toThrow();
    });

    it('should throw an error if biometric key belongs to another user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'another-user' });
      await expect(userService.updateBiometricKey(mockUserId, mockBiometricKey)).rejects.toThrow(BadRequestException);
    });
  });
});
