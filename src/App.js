import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
//list todos 
// add todos
// toggle todos
//delete todos

const GET_TODOS = gql`
  query getTodos {
    todos {
      text
      id
      done
    }
  }
`;

const TOGGLE_TODOS = gql`
  mutation toggleTodos($id: uuid!, $done: Boolean!) {
    update_todos(where: {id: {_eq: $id}}, _set: {done: $done}) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODOS = gql`
  mutation addTodo($text: String!) {
    insert_todos(objects: {text: $text}) {
      returning {
        text
        id
        done
      }
    }
  }
`;

const DELETE_TODOS = gql`
  mutation deleteTodo($id: uuid!) {
    delete_todos(where: {id: {_eq: $id}}) {
      returning {
        text
        id
        done
      }
    }
  }
`;

function App() {
  const [todoText, setTodoText] = React.useState("");
  const {data, loading, error} = useQuery(GET_TODOS);
  const [toggleTodos] = useMutation(TOGGLE_TODOS);
  const [addTodo] = useMutation(ADD_TODOS, {
    onCompleted: () => setTodoText("")
  });
  const [deleteTodo] = useMutation(DELETE_TODOS);

  async function handleToggleTodos({id, done}){
    const data = await toggleTodos({ variables: { id, done: !done } });
    console.log("toggle todo", data);
  }

  async function handleAddTodo(event){
    event.preventDefault();
    if(!todoText.trim()) return;
    const data = await addTodo({ variables: { text: todoText },
      refetchQueries: [
        { query: GET_TODOS }
      ] });
    console.log("added todo", data);
    // setTodoText("");
  }

  async function handleDeleteTodo({ id }){
    const isConfirmed = window.confirm("Do you want to delete?");
    if(isConfirmed){
    const data = await deleteTodo({ variables: { id },
      update: cache => {
        const prevData = cache.readQuery({ query: GET_TODOS });
        const newTodos = prevData.todos.filter(todo => todo.id !== id);
        cache.writeQuery({ query: GET_TODOS, data: { todos: newTodos } });
      }
    });
    console.log(data);
    }
  }

  if(loading) return <div>Loading todos...</div>;
  if(error) return <div>Error fetching todos!</div>;

  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa3 fl-1">
      <h1 className="f2-l">GraphQL Checklist{" "}<span role="img" aria-label="Checkmark">✔️</span></h1>
      {/* todo form */}
      <form onSubmit={handleAddTodo} className="mb3">
        <input 
          className="pa2 f4 b--dashed"
          type="text"
          placeholder="Write your todo"
          onChange={event => setTodoText(event.target.value)}
          value={todoText}
        />
        <button className="pa2 f4 bg-green" type="submit">Create</button>
      </form>
      {/* todo list */}
      <div className="flex items-center justify-center flex-column">
        {data.todos.map(todo => (
          <p onDoubleClick={() => handleToggleTodos(todo)} key={todo.id}>
            <span className={`"pointer list pa1 f3" ${todo.done && "strike"}`}>
              {todo.text}
            </span>
            <button onClick={() => handleDeleteTodo(todo)} className="bg-transparent bn f4"><span className="red">&times;</span></button>
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
