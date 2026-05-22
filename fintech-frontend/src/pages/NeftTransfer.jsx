import TransferForm from '../components/TransferForm';
// NEFT = deferred batch settlement. Same form, different rail.
export default function NeftTransfer() {
  return <TransferForm type="NEFT" />;
}
