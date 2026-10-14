import type { Library } from "../types.ts";

type TakeoffPanelProps = {
  library: Library | null;
  message: string | null;
};

export function TakeoffPanel({ library, message }: TakeoffPanelProps) {
  return (
    <aside className="takeoff" aria-label="Takeoff">
      <header className="panel-header">
        <h2>Takeoff</h2>
      </header>
      <div className="panel-block">
        <p className="empty">
          Quantity and cost lines for the selected plan go here. They are computed and stored by
          the server.
        </p>
      </div>

      <header className="panel-header">
        <h2>Price library {library ? library.version : ""}</h2>
      </header>
      <div className="panel-block">
        {message ? <p className="panel-message">{message}</p> : null}
        {library ? (
          <table className="rates">
            <caption>
              {library.currency} per m². Reference input, not a takeoff.
            </caption>
            <thead>
              <tr>
                <th scope="col">Assembly</th>
                <th scope="col">Rate</th>
              </tr>
            </thead>
            <tbody>
              {library.assemblies.map((assembly) => (
                <tr key={assembly.id}>
                  <th scope="row">{assembly.name}</th>
                  <td>
                    {assembly.rate} {library.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </aside>
  );
}
