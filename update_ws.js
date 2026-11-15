const fs = require('fs');
let file = fs.readFileSync('src/modules/Workspace.jsx', 'utf8');

const target = '{MODULE[current] && <ModuleView key={current + (qs.get(\'view\') || \'\') + (task?.id || \'\')} project={project} m={MODULE[current]} initialView={qs.get(\'view\')} task={task} items={items.filter((x) => x.module === current)} onOpenDocStudio={setDocStudio} onOpenFlightWorkflow={() => setFlightWorkflowOpen(true)} />}';

const replacement = `{current === 'lecturers' ? (
              <CurriculumView
                project={project}
                initialTab="lecturers"
                items={items.filter((x) => x.module === 'lecturers')}
                onOpenDocStudio={setDocStudio}
                onOpenFlightWorkflow={() => setFlightWorkflowOpen(true)}
              />
            ) : (
              MODULE[current] && <ModuleView key={current + (qs.get('view') || '') + (task?.id || '')} project={project} m={MODULE[current]} initialView={qs.get('view')} task={task} items={items.filter((x) => x.module === current)} onOpenDocStudio={setDocStudio} onOpenFlightWorkflow={() => setFlightWorkflowOpen(true)} />
            )}`;

if (file.includes(target)) {
  file = file.replace(target, replacement);
  fs.writeFileSync('src/modules/Workspace.jsx', file, 'utf8');
  console.log('Successfully updated Workspace.jsx');
} else {
  console.log('Target not found in Workspace.jsx');
}
