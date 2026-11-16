interface PropertyMortgageBannerProps {
  estimatedPayment: string;
}

export default function PropertyMortgageBanner({
  estimatedPayment,
}: PropertyMortgageBannerProps) {
  return (
    <div className="bg-[#006655]/5 p-6 rounded-xl border border-[#006655]/10 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full text-[#006655] shadow-sm flex items-center justify-center">
          <span className="material-icons leading-none">calculate</span>
        </div>
        <div>
          <h3 className="font-semibold text-[#19322F]">Estimated Payment</h3>
          <p className="text-sm text-[#19322F]/60">
            Starting from{" "}
            <strong className="text-[#006655]">{estimatedPayment}</strong> with
            20% down
          </p>
        </div>
      </div>
      <button
        type="button"
        className="whitespace-nowrap px-4 py-2 bg-white border border-[#19322F]/10 rounded-lg text-sm font-semibold hover:border-[#006655] transition-colors text-[#19322F] cursor-pointer"
      >
        Calculate Mortgage
      </button>
    </div>
  );
}
