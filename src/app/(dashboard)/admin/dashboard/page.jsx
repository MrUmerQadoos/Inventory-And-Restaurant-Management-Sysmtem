// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import Award from '@views/dashboard/Award'
import Transactions from '@views/dashboard/Transactions'
import TotalEarning from '@views/dashboard/TotalEarning'
import DepositWithdraw from '@views/dashboard/DepositWithdraw'
import SalesByCountries from '@views/dashboard/SalesByCountries'
import CardStatVertical from '@components/card-statistics/Vertical'
import Table from '@views/dashboard/Table'

const DashboardAnalytics = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4} xl={2}>
        <CardStatVertical
          title='Total Profit'
          stats='$25.6k'
          avatarIcon='ri-pie-chart-2-line'
          avatarColor='secondary'
          subtitle='Weekly Profit'
          trendNumber='42%'
          trend='positive'
        />
      </Grid>
      <Grid item xs={12} md={8} xl={10}>
        <Transactions />
      </Grid>

      <Grid item xs={12} md={6} lg={7}>
        <TotalEarning />
      </Grid>

      <Grid item xs={12}>
        <Table />
      </Grid>
    </Grid>
  )
}

export default DashboardAnalytics
