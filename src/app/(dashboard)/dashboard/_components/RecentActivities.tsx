import { FileCheck, FileUp, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

const RecentActivities = () => {
  return (
    <div className="mx-auto max-w-5xl">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {/* Activity Item 1 */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
              <FileCheck className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Solar Farm Project Approved
              </p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-brand-600">
            View details
          </Button>
        </div>

        {/* Activity Item 2 */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <FileUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Verification Document Uploaded
              </p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-brand-600">
            View details
          </Button>
        </div>

        {/* Activity Item 3 */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Wind className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Wind Energy Project Under Review
              </p>
              <p className="text-sm text-gray-500">3 days ago</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-brand-600">
            View details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
