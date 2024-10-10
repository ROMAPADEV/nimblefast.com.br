import { eachWeekOfInterval, lastDayOfWeek } from 'date-fns'
import { getDateInterval, getDateFormatted } from 'src/infrastructure/utils'

interface Props {
  startDate?: Date | undefined
  endDate?: Date | undefined
}

export function weeksBetweenDates({ startDate, endDate }: Props) {
  const { initDate, endDate: dateEnd } = getDateInterval()

  const start = startDate || initDate
  const end = endDate || dateEnd

  return eachWeekOfInterval({ start, end }).map(
    (dateCur, index, weeksArray) => ({
      start: getDateFormatted(
        index === 0 ? start : dateCur,
        'yyyy-MM-dd 00:00:00',
      ),
      end: getDateFormatted(
        index === weeksArray.length - 1 ? end : lastDayOfWeek(dateCur),
        'yyyy-MM-dd 23:59:59',
      ),
    }),
  )
}
