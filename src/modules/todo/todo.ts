import {
  Arg,
  Args,
  Authorized,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Todo } from "../../entity/Todo";
import { User } from "../../entity/User";
import { AuthContext } from "../../middlewares/auth/context";
import { Pagination } from "../pagination";
import {
  CreateTodoInput,
  PaginateTodoResponse,
  UpdateTodoInput,
} from "./todo.validate";

@Resolver()
export class TodoResolver {
  private todoRepository = getRepository(Todo);
  private userRepository = getRepository(User);

  @Authorized()
  @Query(() => Todo)
  async getTodoById(
    @Arg("id") id: string,
    @Ctx() { req }: AuthContext
  ): Promise<Todo> {
    const userId = req.auth!.userId;

    const user = this.userRepository.create({ id: userId });

    const todo = await this.todoRepository.findOne({
      where: { id: id, user: user },
    });

    // const todo2 = await this.todoRepository.query(
    //   `SELECT * FROM todo WHERE id = '${id}'`
    // );

    // console.log(todo);
    // console.log(todo2);

    if (!todo) {
      throw new Error("Todo not found");
    }

    return todo;
  }

  @Authorized()
  @Query(() => PaginateTodoResponse)
  async getAllTodo(
    @Args() { page, limit }: Pagination,
    @Ctx() { req }: AuthContext
  ): Promise<PaginateTodoResponse> {
    const userId = req.auth!.userId;
    const user = this.userRepository.create({ id: userId });

    const _page = page || 1;
    const _limit = limit || 5;
    const skip = (_page - 1) * _limit;

    const [todos, count] = await this.todoRepository.findAndCount({
      where: { user: user },
      order: { createdAt: "ASC" },
      skip: skip,
      take: _limit,
    });

    return {
      count,
      limit: _limit,
      currentPage: _page,
      totalPage: Math.ceil(count / _limit),
      todos,
    };
  }

  @Authorized()
  @Mutation(() => String)
  async updateTodo(
    @Args() { id, data }: UpdateTodoInput,
    @Ctx() { req }: AuthContext
  ): Promise<string> {
    const userId = req.auth!.userId;
    const user = this.userRepository.create({ id: userId });

    const todo = await this.todoRepository.findOne({
      where: { id: id, user: user },
    });

    if (!todo) {
      throw new Error("Todo not found");
    }

    await this.todoRepository.update(id, data);

    return "Update successfully";
  }

  @Authorized()
  @Mutation(() => String)
  async deleteTodo(
    @Arg("id") id: string,
    @Ctx() { req }: AuthContext
  ): Promise<string> {
    const userId = req.auth!.userId;
    const user = this.userRepository.create({ id: userId });

    const todo = await this.todoRepository.findOne({
      where: { id: id, user: user },
    });

    if (!todo) {
      throw new Error("Todo not found");
    }

    await this.todoRepository.delete(id);

    return "Delete successfully";
  }

  @Authorized()
  @Mutation(() => Todo)
  async createTodo(
    @Arg("data") data: CreateTodoInput,
    @Ctx() { req }: AuthContext
  ): Promise<Todo> {
    const userId = req.auth!.userId;

    const user = this.userRepository.create({ id: userId });

    const todo = this.todoRepository.create({
      name: data.name,
      description: data.description,
      isCompleted: data.isCompleted,
      user: user,
    });

    await this.todoRepository.save(todo);

    return todo;
  }
}
