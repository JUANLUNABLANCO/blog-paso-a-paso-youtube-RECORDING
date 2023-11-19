// ESM
import { faker } from '@faker-js/faker';
import { User } from './user.interface';

export function createRandomUser(): User {
  return {
    // id: Number(faker.datatype.uuid()),
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password()
  };
}

export const USERS: User[] = faker.helpers.multiple(createRandomUser, {
  count: 25,
});