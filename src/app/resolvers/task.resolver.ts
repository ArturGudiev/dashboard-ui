// export const taskResolver: ResolveFn<boolean> = (route, state) => {
//   const service = inject(TasksService);
//   const id = route.paramMap.get('id');  // Fetch the route parameter
//   if (id && Number.isInteger(id)) {
//     return service.getTask(+id);  // Fetch data or return a default value
//   }
//   return of(null);
// };
