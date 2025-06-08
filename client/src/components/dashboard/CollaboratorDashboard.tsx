import { DashboardCard } from './DashboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import type { DashboardStats } from '@/lib/types';

const stats: DashboardStats[] = [
  {
    title: 'My Tasks',
    value: '15',
    change: '7 completed',
    changeType: 'positive',
    icon: '✅',
    iconColor: 'blue'
  },
  {
    title: 'Active Projects',
    value: '5',
    change: '2 urgent',
    changeType: 'neutral',
    icon: '📊',
    iconColor: 'purple'
  },
  {
    title: 'Hours Logged',
    value: '34.5',
    change: '6.5 hrs',
    changeType: 'positive',
    icon: '⏰',
    iconColor: 'green'
  },
  {
    title: 'Messages',
    value: '8',
    change: '3 unread',
    changeType: 'negative',
    icon: '💬',
    iconColor: 'orange'
  }
];

const tasks = [
  { task: 'Review design mockups', due: '2:00 PM', priority: 'High', completed: false },
  { task: 'Update project documentation', due: 'Completed', priority: 'Done', completed: true },
  { task: 'Team standup meeting', due: '4:30 PM', priority: 'Medium', completed: false }
];

const projectProgress = [
  { name: 'Website Redesign', progress: 75, color: 'bg-blue-600' },
  { name: 'Mobile App Testing', progress: 45, color: 'bg-yellow-500' },
  { name: 'API Integration', progress: 90, color: 'bg-green-600' }
];

export function CollaboratorDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <DashboardCard key={index} stats={stat} />
        ))}
      </div>

      {/* Tasks and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Checkbox checked={task.completed} />
                  <div className="flex-1">
                    <p className={`text-sm text-gray-900 dark:text-white ${task.completed ? 'line-through' : ''}`}>
                      {task.task}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {task.completed ? 'Completed' : `Due: ${task.due}`}
                    </p>
                  </div>
                  <Badge variant={
                    task.priority === 'High' ? 'destructive' :
                    task.priority === 'Medium' ? 'secondary' :
                    task.priority === 'Done' ? 'default' : 'outline'
                  }>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectProgress.map((project, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{project.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
