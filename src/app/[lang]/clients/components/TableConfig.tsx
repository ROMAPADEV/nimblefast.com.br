import {
  Table,
  TableHead,
  TableCell,
  TableRow,
  Tooltip,
  IconButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import moment from 'moment'
import { Config } from 'src/infrastructure/types'
import { maskMoney } from 'src/infrastructure/utils'
import { AlertReact } from 'src/components'
import { api, exibirError } from 'src/adapters'

interface Props {
  configs: Config[]
  updateConfigs: () => void
}

export function TableConfig({ configs, updateConfigs }: Props) {
  async function deleteConfig(id: number) {
    try {
      await api.del(`/config/${id}`)
      updateConfigs()
    } catch (error) {
      exibirError(error)
    }
  }

  return (
    <Table>
      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
        <TableRow>
          <TableCell>Categoria</TableCell>
          <TableCell>Valor</TableCell>
          <TableCell>Data do cadastro</TableCell>
          <TableCell>Ações</TableCell>
        </TableRow>
      </TableHead>
      {configs.map((config) => (
        <TableRow key={config.id}>
          <TableCell>{config.name}</TableCell>
          <TableCell>{maskMoney(Number(config.value))}</TableCell>
          <TableCell>{moment(config.createdAt).format('DD/MM/YYYY')}</TableCell>
          <TableCell>
            <Tooltip title="Excluir Cliente">
              <IconButton
                aria-label="Excluir"
                color="error"
                onClick={() => {
                  AlertReact.confirmation({
                    titulo: 'Atenção',
                    texto: 'Esse item será removido permanentemente',
                    showCloseButton: true,
                    confirmButtonColor: '#e02d1b',
                    confirmButtonText: 'Sim, excluir',
                    showCancelButton: true,
                    cancelButtonColor: '#858796',
                    cancelButtonText: 'Voltar',
                    showLoaderOnConfirm: true,
                    preConfirm: () => deleteConfig(config.id),
                  })
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  )
}
