import Swal from 'sweetalert2'
import withReactContent, {
  ReactSweetAlertOptions,
} from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

interface WarningRemoveProps extends ReactSweetAlertOptions {
  titulo: string
  texto: string
}

const confirmation = ({ titulo, texto, ...rest }: WarningRemoveProps) =>
  MySwal.fire({
    ...rest,
    customClass: {
      container: 'custom-sweet-alert-2',
    },
    html: (
      <div>
        <h4>
          <b>{titulo}</b>
        </h4>
        <hr />
        <p
          className="card-text my-1 text-secondary"
          style={{ textAlign: 'left' }}
        >
          {texto}
        </p>
      </div>
    ),
  })

export const AlertReact = {
  MySwal,
  confirmation,
}
