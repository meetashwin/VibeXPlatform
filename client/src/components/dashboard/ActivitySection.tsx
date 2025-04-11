import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Activity } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const ActivitySection = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/activities");
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (error) {
        console.error("Failed to load activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return { icon: 'ri-git-commit-line', bg: 'bg-accent text-white' };
      case 'ai':
        return { icon: 'ri-robot-fill', bg: 'bg-primary text-black' };
      case 'user':
        return { icon: 'ri-user-add-line', bg: 'bg-secondary text-black' };
      case 'deployment':
        return { icon: 'ri-check-line', bg: 'bg-[#4CAF50] text-white' };
      default:
        return { icon: 'ri-information-line', bg: 'bg-gray-500 text-white' };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-2xl font-bold">Recent Activity</h2>
      </div>
      
      <div className="bg-white border-4 border-black p-4 brutal-shadow">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No recent activity</div>
            ) : (
              activities.map((activity) => {
                const { icon, bg } = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`w-8 h-8 ${bg} border-2 border-black flex-shrink-0 flex items-center justify-center`}>
                      <i className={icon}></i>
                    </div>
                    <div>
                      <div className="font-medium">
                        {activity.description}
                        {activity.projectId && (
                          <Link href={`/projects/${activity.projectId}`} className="font-bold">
                            {" "}{activity.projectName}
                          </Link>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{formatDate(activity.timestamp)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
        
        <Link href="/activities" className="block mt-4 text-center font-medium hover:underline">
          View all activity
        </Link>
      </div>
    </div>
  );
};

export default ActivitySection;
