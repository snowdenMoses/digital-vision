import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class User {
    @Field({ nullable: false })
    id?: string;

    @Field({ nullable: false })
    email: string;

    @Field({ nullable: true })
    biometricKey?: string;

    @Field({ nullable: true })
    accessToken?: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}