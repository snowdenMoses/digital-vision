import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { access } from 'fs';

const mockUser = { id: '123', email: 'test@example.com' };
const mockToken = { accessToken: 'mocked-jwt-token' } ;

const mockUserService = {
  getUserById: jest.fn().mockResolvedValue(mockUser),
  register: jest.fn().mockResolvedValue(mockUser),
  login: jest.fn().mockResolvedValue(mockToken ),
  biometricLogin: jest.fn().mockResolvedValue( mockToken ),
};

describe('UserResolver', () => {
  let resolver: UserResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  describe('register', () => {
    it('should register a user and return user data', async () => {
      const email = 'test@example.com';
      const password = 'securepassword';

      const result = await resolver.register(email, password);
      expect(result).toEqual(mockUser);
      expect(mockUserService.register).toHaveBeenCalledWith(email, password);
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const email = 'test@example.com';
      const password = 'securepassword';

      const result = await resolver.login(email, password);
      console.log("resultresult", result)
      expect(result).toBe(mockToken);
      expect(mockUserService.login).toHaveBeenCalledWith(email, password);
    });
  });

  describe('biometricLogin', () => {
    it('should return a JWT token for biometric login', async () => {
      const biometricKey = 'biometric123';

      const result = await resolver.biometricLogin(biometricKey);
      expect(result).toBe(mockToken);
      expect(mockUserService.biometricLogin).toHaveBeenCalledWith(biometricKey);
    });
  });
});
