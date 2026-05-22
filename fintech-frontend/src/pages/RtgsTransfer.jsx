import TransferForm from '../components/TransferForm';
// RTGS = instant settlement. All logic lives in the shared TransferForm.
export default function RtgsTransfer() {
  return <TransferForm type="RTGS" />;
}
