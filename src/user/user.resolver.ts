import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/authentication/gql.auth.guard';
import { CurrentUser } from 'src/authentication/current.user.decorator';

@Resolver(User)
export class UserResolver {
    constructor(private userService: UserService) { }

    @Query(() => User)
    async getUserById( @Args('userId') userId: string) {
        return this.userService.getUserById(userId);
    }

    @Mutation(() => User)
    async register(
        @Args('email') email: string,
        @Args('password') password: string,
    ) {
        return this.userService.register(email, password);
    }

    @Mutation(() => User )
    async login(
        @Args('email') email: string,
        @Args('password') password: string,
    ) {
        const userLoginDetails = await this.userService.login(email, password);
        return userLoginDetails;
    }

    @Mutation(() => User)
    async biometricLogin(@Args('biometricKey') biometricKey: string) {
        const userLoginDetails = await this.userService.biometricLogin(biometricKey);
        return userLoginDetails;
    }

    @Mutation(() => String)
    async updateBiometricKey(@Args('userId') userId: string, @Args('biometricKey') biometricKey: string) {
        await this.userService.updateBiometricKey(userId, biometricKey);
        return "Update Biometrics successfully";
    }
}