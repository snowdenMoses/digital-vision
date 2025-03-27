import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { createVerify } from 'crypto';
import { UserDTO } from './dto/user.dto';
import { User } from './user.model';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

    async register(email: string, password: string): Promise<UserDTO> {
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new BadRequestException('Email is already taken');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.prisma.user.create({
            data: { email, password: hashedPassword },
        });

        return this.entityToUserDTO(newUser)
    }

    async getUserById(userId: string): Promise<UserDTO> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.entityToUserDTO(user)
    }

    async login(email: string, password: string): Promise<UserDTO> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid email or password');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException('Invalid email or password');

        const token = this.jwtService.sign({ userId: user.id, email: user.email });
        return {
            ...this.entityToUserDTO(user),
            accessToken: token
        };
    }

    async biometricLogin(biometricKey: string): Promise<UserDTO> {
        const user = await this.prisma.user.findUnique({ where: { biometricKey } });
        if (!user) throw new UnauthorizedException('Biometric key not found');
        const token = this.jwtService.sign({ userId: user.id, email: user.email });
        return {
            ...this.entityToUserDTO(user),
            accessToken: token
        };
    }

    // Real world biometric implementaion
    // async biometricLogin(
    //     signature: string,
    //     payload: string
    // ): Promise<UserDTO> {

    //     const userId = payload.split("__")[0];

    //     const user: UserDTO = await this.getUserById(userId);
    //     if (!user) throw new NotFoundException("User not found")

    //     const { biometricKey } = user;

    //     const verifier = createVerify("RSA-SHA256");
    //     verifier.update(payload);

    //     const isVerified = verifier.verify(
    //         `-----BEGIN PUBLIC KEY-----\n${biometricKey}\n-----END PUBLIC KEY-----`,
    //         signature,
    //         "base64"
    //     );

    //     const token = this.jwtService.sign({ userId: user.id, email: user.email });
    //     if (!isVerified) throw new BadRequestException("Incorrect biometrics")
    //     return {
    //         ...user,
    //         accessToken: token
    //     }
    // }

    async updateBiometricKey(userId: string, biometricKey: string): Promise<void> {
        // In real life, this will be encrypted with private key, and authenticated with the public key
        const biometricKeyExist = await this.prisma.user.findUnique({ where: { biometricKey } });
        if(biometricKeyExist && biometricKeyExist.id != userId){
            throw new BadRequestException("Biometric key already belongs to another user")
        }
        const updatedBiometrics = await this.prisma.user.update({
            where: { id: userId },
            data: { biometricKey }
        })
        if (!updatedBiometrics) throw new InternalServerErrorException("Error while updating user's biometric");
    }

    private entityToUserDTO(entity: User): UserDTO {
        return {
            id: entity.id,
            email: entity.email,
            biometricKey: entity.biometricKey,
            createdAt: entity.createdAt
        }
    }


}

