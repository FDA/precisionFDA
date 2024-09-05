export class UserContext {
  constructor(
    readonly id: number,
    readonly accessToken: string,
    readonly dxuser: string,
  ) {}
}
