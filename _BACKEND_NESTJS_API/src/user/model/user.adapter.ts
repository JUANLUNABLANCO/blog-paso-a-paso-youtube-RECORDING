import { UserReadWithEntriesDto, UserReadWithoutEntriesDto } from './user.dto';

export class UserAdapter {
  static adaptToUserReadWithEntriesDto(
    userFromDB: any,
  ): UserReadWithEntriesDto {
    return {
      id: userFromDB.id,
      userName: userFromDB.userName,
      email: userFromDB.email,
      role: userFromDB.role,
      blogEntries: userFromDB.blogEntries,
      profileImage: userFromDB.profileImage,
    };
  }
  static adaptToUserReadWithoutEntriesDto(
    userFromDB: any,
  ): UserReadWithoutEntriesDto {
    return {
      id: userFromDB.id,
      userName: userFromDB.userName,
      email: userFromDB.email,
      role: userFromDB.role,
      profileImage: userFromDB.profileImage,
    };
  }
}
