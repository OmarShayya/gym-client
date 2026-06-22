import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { membersApi, type MemberResponseDto } from "../api/members.api";
import {
  buildWhatsAppUrl,
  expiryReminderMessage,
} from "../utils/whatsapp";

const daysUntil = (membershipEndDate: string): number => {
  const now = new Date();
  const end = new Date(membershipEndDate);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const daysLabel = (days: number): string => {
  if (days <= 0) return "Expires today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
};

const sendReminder = (member: MemberResponseDto) => {
  const url = buildWhatsAppUrl(
    member.phone,
    expiryReminderMessage(member.firstName, member.membershipEndDate)
  );
  window.open(url, "_blank");
};

interface ExpiringSoonProps {
  days?: number;
}

const ExpiringSoon = ({ days = 7 }: ExpiringSoonProps) => {
  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["members", "expiring", days],
    queryFn: () => membersApi.getExpiring(days),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-dark"
    >
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Expiring Soon</h3>
          <p className="text-gray-400 text-sm">
            Active memberships ending within {days} days
          </p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/20">
          <FaWhatsapp className="text-green-500 text-xl" />
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : isError ? (
          <p className="text-red-500 text-center py-4 text-sm">
            Failed to load expiring memberships.
          </p>
        ) : members.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            No memberships expiring soon 🎉
          </p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const remaining = daysUntil(member.membershipEndDate);
              return (
                <div
                  key={member.id || member._id || member.memberId}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">
                      <span className="font-mono text-primary-500">
                        {member.memberId}
                      </span>{" "}
                      •{" "}
                      <span
                        className={
                          remaining <= 3 ? "text-red-500" : "text-yellow-500"
                        }
                      >
                        {daysLabel(remaining)}
                      </span>
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendReminder(member)}
                    className="relative z-10 flex items-center space-x-2 px-3 py-2 bg-green-500/20 text-green-500 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-all cursor-pointer select-none flex-shrink-0"
                    style={{ userSelect: "none" }}
                  >
                    <FaWhatsapp className="pointer-events-none" />
                    <span className="pointer-events-none text-sm font-medium hidden sm:inline">
                      WhatsApp Reminder
                    </span>
                  </motion.button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ExpiringSoon;
